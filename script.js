var juego = new Phaser.Game(370, 680, Phaser.CANVAS, 'bloque_juego');
//Variables globales
var fondoJuego;
var personaje;
var personaje2;
var teclaDerecha;
var teclaIzquierda;
var teclaADerecha;
var teclaAIzquierda;
var enemigos;
var balas;
var balas2;
var tiempoBala = 0;
var tiempoBala2 = 0;
var botonDisparo;
var botonDisparo2;
var puntuacion = 0;
var textoScore;
var puntuacion1 = 0;
var puntuacion2 = 0;
var textoScore1, textoScore2;
var sonidoDisparo, sonidoColision, musicaFondo;

var seleccion = 0; // 0: 1 Jugador, 1: 2 Jugadores
var opcionesTexto = [];

//Estado del menu principal
var estadoMenu = {
    preload: function () {

        juego.load.image('portada', 'imagenes/portada.jpg');
        juego.load.audio('disparo', 'sonido/disparo.ogg');
        juego.load.audio('colision', 'sonido/colision.mp3');
        juego.load.audio('fondo',    'sonido/fondo.mp3');
    },
    create: function () {
        //Portada
        juego.add.sprite(0, 0, 'portada');

        var estilo = { font: '30px Arial', fill: '#ffffff' };

        // Texto "START GAME" con parpadeo
        var startText = juego.add.text(juego.world.centerX, 100, 'START GAME', {
            font: '40px Arial', fill: '#ffffff'
        });
        startText.anchor.setTo(0.5);
        juego.add.tween(startText).to({ alpha: 0 }, 500, null, true, 0, -1, true);

        // Opciones de menu: 1 Jugador y 2 Jugadores
        opcionesTexto[0] = juego.add.text(juego.world.centerX, 400, '1 Jugador', estilo);
        opcionesTexto[1] = juego.add.text(juego.world.centerX, 450, '2 Jugadores', estilo);
        opcionesTexto[0].anchor.setTo(0.5);
        opcionesTexto[1].anchor.setTo(0.5);
        // presionar ENTER
        var enterText = juego.add.text(juego.world.centerX, 580, 'PRESIONE ENTER', {
            font: '28px Arial', fill: '#ffffff'
        });
        enterText.anchor.setTo(0.5);
        juego.add.tween(enterText).to({ alpha: 0 }, 500, null, true, 0, -1, true);

        // Texto de mi
        var autorTexto = juego.add.text(juego.world.centerX, 650, ' Angie Mina Ishuiza', {
            font: '20px Arial', fill: '#ffffff'
        });
        autorTexto.anchor.setTo(0.5);

        // Navegación con flechas UP/DOWN para cambiar selección
        juego.input.keyboard.addKey(Phaser.Keyboard.UP).onDown.add(() => {
            seleccion = (seleccion - 1 + 2) % 2;
            actualizarSeleccion();
        });

        juego.input.keyboard.addKey(Phaser.Keyboard.DOWN).onDown.add(() => {
            seleccion = (seleccion + 1) % 2;
            actualizarSeleccion();
        });

        // Al presionar ENTER, iniciar el estado
        juego.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(() => {
            if (seleccion === 0) {
                juego.state.start('principal'); //1player
            } else {
                juego.state.start('dosJugadores'); //2player
            }
        });

        actualizarSeleccion();
    }
};

// Funcion para resaltar la opcion seleccionada del menu
function actualizarSeleccion() {
    for (var i = 0; i < opcionesTexto.length; i++) {
        opcionesTexto[i].fill = (i === seleccion) ? '#ff0' : '#fff';
    }
}

//Estado 1 player
var estadoPrincipal = {
    preload: function () {

        juego.load.image('fondo', 'imagenes/bg.png');
        juego.load.spritesheet('animacion', 'imagenes/personajeS.png', 256, 256);
        juego.load.spritesheet('enemigo', 'imagenes/enemigo1.jpg', 48, 48);
        juego.load.image('laser', 'imagenes/laser.png');

        
    },
    create: function () {
        //Bucle del fondo y animacion
        fondoJuego = juego.add.tileSprite(0, 0, 370, 680, 'fondo');
        personaje = juego.add.sprite(90, 460, 'animacion');
        personaje.animations.add('movimiento', [0, 1, 2, 3, 4], 10, true);

        //sonidos
        sonidoDisparo  = juego.add.audio('disparo');
        sonidoColision = juego.add.audio('colision');
        musicaFondo    = juego.add.audio('fondo');
        musicaFondo.loop = true;
        musicaFondo.volume = 0.5; 
        musicaFondo.play();

        // Grupo de balas del jugador
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, 'laser');
        balas.setAll('anchor.x', -2);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);

        // grupo de enemigos 3x3
        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var enemig = enemigos.create(x * 50, y * 50, 'enemigo');
                enemig.anchor.setTo(0.5);
            }
        }
        enemigos.x = 100;
        enemigos.y = 100;

        // Ir y venir en el eje X al enemigo
        juego.add.tween(enemigos).to({ x: 200 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        // Teclas de movimiento del jugador
        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);

        //puntuacion inicial
        puntuacion = 0;
        textoScore = juego.add.text(10, 10, 'Score: 0', {
        font: '20px Arial',
        fill: '#ffffff'
        });
    },
    update: function () {
        // Desplaza el fondo
        fondoJuego.tilePosition.x -= 1;

        //Movimiento del player y animacion
        if (teclaDerecha.isDown) {
            personaje.x++;
            personaje.animations.play('movimiento');
        } else if (teclaIzquierda.isDown) {
            personaje.x--;
            personaje.animations.play('movimiento');
        }

        // Limites de pantalla para el jugador
        if (personaje.x < -100) {
            personaje.x = -100;
        } else if (personaje.x > 210) {
            personaje.x = 210;
        }

        // Disparo de balas si presiona SPACE
        var bala;
        if (botonDisparo.isDown && juego.time.now > tiempoBala) {
            bala = balas.getFirstExists(false);
            if (bala) {
                sonidoDisparo.play();
                bala.reset(personaje.x + 20, personaje.y);
                bala.body.velocity.y = -300;
                tiempoBala = juego.time.now + 100;
            }
        }

        // Detección de colisión entre balas y enemigos
        juego.physics.arcade.overlap(balas, enemigos, colision, null, this);

        function colision(bala, enemigo) {
        bala.kill();
        enemigo.kill();

        // Score
        if (juego.state.current === 'principal') {
            sonidoColision.play();
            puntuacion++;
            textoScore.text = 'Score: ' + puntuacion;
        //Si enemigos eliminados
         if (puntuacion >= 9) {
            musicaFondo.stop();
             alert('¡GANASTE! Regresa al menú prinicpal');
            juego.state.start('menu');
            }
        }
        }
    }
};
//Estado 2 players
var estadoDosJugadores = {
    preload: function () {
       
        juego.load.image('fondo', 'imagenes/bg.png');
        juego.load.spritesheet('jugador1', 'imagenes/personajeS.png', 256, 256);
        juego.load.spritesheet('jugador2', 'imagenes/personaje2.png', 256, 256);
        juego.load.spritesheet('enemigo3', 'imagenes/enemigo3.jpg', 48, 48);
        juego.load.image('laser', 'imagenes/laser.png');
        juego.load.image('laser2', 'imagenes/laser2.png');
    },
    create: function () {
        // Fondo 
        fondoJuego = juego.add.tileSprite(0, 0, 370, 680, 'fondo');
        
        // Jugador 1
        personaje = juego.add.sprite(60, 460, 'jugador1');
        personaje.animations.add('movimiento', [0, 1, 2, 3, 4], 10, true);
        
        // Jugador 2
        personaje2 = juego.add.sprite(40, 460, 'jugador2');
        personaje2.animations.add('movimiento', [0, 1, 2, 3, 4], 10, true);

        //Sonido
        sonidoDisparo  = juego.add.audio('disparo');
        sonidoColision = juego.add.audio('colision');
        musicaFondo    = juego.add.audio('fondo');
        musicaFondo.loopFull(0.5);

        // Grupos de balas para ambos jugadores
        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, 'laser');
        balas.setAll('anchor.x', -2);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);

        balas2 = juego.add.group();
        balas2.enableBody = true;
        balas2.physicsBodyType = Phaser.Physics.ARCADE;
        balas2.createMultiple(20, 'laser2');
        balas2.setAll('anchor.x', -2);
        balas2.setAll('anchor.y', 1);
        balas2.setAll('outOfBoundsKill', true);
        balas2.setAll('checkWorldBounds', true);

        // Enemigos y movimiento
        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;

        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var enemig = enemigos.create(x * 50, y * 50, 'enemigo3');
                enemig.anchor.setTo(0.5);
            }
        }

        enemigos.x = 100;
        enemigos.y = 100;
        juego.add.tween(enemigos).to({ x: 200 }, 1000, Phaser.Easing.Linear.None, true, 0, 1000, true);

        // Teclas: jugador1 usa flechas + SPACE
        teclaDerecha = juego.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        teclaIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Teclas: jugador1 usa usa A/D + ENTER
        teclaADerecha = juego.input.keyboard.addKey(Phaser.Keyboard.D);
        teclaAIzquierda = juego.input.keyboard.addKey(Phaser.Keyboard.A);
        botonDisparo2 = juego.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        //score inicial
        puntuacion1 = 0;
        puntuacion2 = 0;
        textoScore1 = juego.add.text( 10, 10, 'Score J1: 0', { font: '20px Arial', fill: '#ffffff' } );
        textoScore2 = juego.add.text( 10, 35, 'Score J2: 0', { font: '20px Arial', fill: '#ffffff' } );
        
    },
    update: function () {
        fondoJuego.tilePosition.x -= 1;

        // Movimiento player 1
        if (teclaDerecha && teclaDerecha.isDown) {
            personaje.x++;
            personaje.animations.play('movimiento');
            
        } else if (teclaIzquierda && teclaIzquierda.isDown) {
            personaje.x--;
            personaje.animations.play('movimiento');
            
        }

         //LIMITES Player1
        if (personaje.x < -100) {
            personaje.x = -100;
        } else if (personaje.x > 210) {
            personaje.x = 210;
        }

        // Disparo player 1
        if (botonDisparo && botonDisparo.isDown && juego.time.now > tiempoBala) {
            var bala = balas.getFirstExists(false);
            if (bala) {
                sonidoDisparo.play();
                bala.reset(personaje.x + 20, personaje.y);
                bala.body.velocity.y = -300;
                tiempoBala = juego.time.now + 100;
                
            }
        }

        // Movimiento jugador 2
        if (teclaADerecha && teclaADerecha.isDown) {
            personaje2.x++;
            personaje2.animations.play('movimiento');
            
        } else if (teclaAIzquierda && teclaAIzquierda.isDown) {
            personaje2.x--;
            personaje2.animations.play('movimiento');
            
        }

         //LIMITES Player 2
        if (personaje2.x < -100) {
            personaje2.x = -100;
        } else if (personaje2.x > 210) {
            personaje2.x = 210;
        }
        // Disparo player 2 
        if (botonDisparo2 && botonDisparo2.isDown && juego.time.now > tiempoBala2) {
            var bala2 = balas2.getFirstExists(false);
            if (bala2) {
                sonidoDisparo.play();
                bala2.reset(personaje2.x + 20, personaje2.y);
                bala2.body.velocity.y = -300;
                tiempoBala2 = juego.time.now + 100;
                
            }
        }

        // Colision: balas player 1 y enemigos
        juego.physics.arcade.overlap(
          balas, enemigos,
          function(bala, enemigo) {
            sonidoColision.play();
            bala.kill();
            enemigo.kill();
            puntuacion1++;
            textoScore1.text = 'Score J1: ' + puntuacion1;

            // Acaba con enemigos
            if (enemigos.countLiving() === 0) {
                musicaFondo.stop();
              // Decide ganador
              var msg = puntuacion1 > puntuacion2
                ? '¡GANA JUGADOR 1!'
                : (puntuacion2 > puntuacion1
                    ? '¡GANA JUGADOR 2!'
                    : '¡EMPATE!');
              alert(msg);
              juego.state.start('menu');
            }
          },
          null, this
);

        // Colision: balas player 2 y enemigos
        juego.physics.arcade.overlap(
          balas2, enemigos,
          function(bala2, enemigo) {
            sonidoColision.play();
            bala2.kill();
            enemigo.kill();
            puntuacion2++;
            textoScore2.text = 'Score J2: ' + puntuacion2;

            if (enemigos.countLiving() === 0) {
                musicaFondo.stop();
              var msg = puntuacion1 > puntuacion2
                ? '¡GANA JUGADOR 1!'
                : (puntuacion2 > puntuacion1
                    ? '¡GANA JUGADOR 2!'
                    : '¡EMPATE!');
              alert(msg);
              juego.state.start('menu');
            }
          },
          null, this
        );
    }
};


// Estados del juego
juego.state.add('menu', estadoMenu);
juego.state.add('principal', estadoPrincipal);
juego.state.add('dosJugadores', estadoDosJugadores);

// Inicia desde el menú
juego.state.start('menu');
