startGame = (difSetting) => {
  const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

  const cellsX = difSetting[0];
  const cellsY = difSetting[1];
  const setSpeed = difSetting[2];

  const width = window.innerWidth - 30;
  const height = window.innerHeight -30;
  const borderWidth = 5;
  const unitLengthX = width / cellsX;
  const unitLengthY = height / cellsY;

  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const {world} = engine;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
  });
  Render.run(render);
  Runner.run(Runner.create(), engine);

  // Outer Walls
  const wallColor = '#457b9d';
  const walls = [
    Bodies.rectangle(width / 2, 0, width, borderWidth, {isStatic: true, render: {fillStyle: wallColor}}),
    Bodies.rectangle(width / 2, height, width, borderWidth, {isStatic: true,  render: {fillStyle: wallColor}}),
    Bodies.rectangle(0, height / 2, borderWidth, height, {isStatic: true,  render: {fillStyle: wallColor}}),
    Bodies.rectangle(width, height / 2, borderWidth, height, {isStatic: true,  render: {fillStyle: wallColor}})
  ];
  World.add(world, walls);


  init = () => {

    // Maze generation
    const shuffle = (arr) => {
      let counter = arr.length;

      while(counter > 0) {
        const index = Math.floor(Math.random() * counter);

        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
      }
      return arr;
    };

    const grid = Array(cellsX)
      .fill(null)
      .map(() => Array(cellsY).fill(false));

    const verticals = Array(cellsY)
      .fill(null)
      .map(() => Array(cellsX - 1).fill(false));

    const horizontals = Array(cellsY - 1)
      .fill(null)
      .map(() => Array(cellsX).fill(false));

    const startRow = Math.floor(Math.random() * cellsY);
    const startColumn = Math.floor(Math.random() * cellsX);

    // Change verticals and horizontals arrays to represent random maze
    const stepThroughCell = (row, column) => {
      // If i have visited the cell at [row, column], then return
      if(grid[row][column] === true) {
          return;
      }
      // Mark this cell as visited
      grid[row][column] = true;
      // Assemble randomly-orderes list of neighbors
      const neighbors = shuffle([
        [row, column - 1, 'left'], 
        [row, column + 1, 'right'],
        [row - 1, column, 'up'],
        [row + 1, column, 'down']
      ]);
      // For each neighbor...
      for(let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
        // See if that neighbor is out of bounce
        if(nextRow < 0 || nextRow >= cellsY || nextColumn < 0 || nextColumn >= cellsX) {
          // continue means don't do anything with this item and continue the loop
          continue;
        }
        // If we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn]) {
          continue;
        }
        // Remove a wall from either horizontals or vertical array
        if(direction === 'left') {
          verticals[row][column - 1] = true;
        } else if(direction === 'right') {
          verticals[row][column] = true;
        } else if(direction === 'up') {
          horizontals[row - 1][column] = true;
        } else {
          horizontals[row][column] = true;
        }
        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
      }
    }
    stepThroughCell(startRow, startColumn);

    // Draw horizontal walls

    horizontals.forEach((row, rowIndex) => {
      row.forEach((open, columnIndex) => {
        if(open){
          return;
        }
    
        const wall = Bodies.rectangle(
          columnIndex * unitLengthX + unitLengthX / 2,
          rowIndex * unitLengthY + unitLengthY,
          unitLengthX,
          borderWidth,
          {
            label: 'wall',
            isStatic: true,
            render: {
              fillStyle: wallColor
            }
          }
        );
        World.add(world, wall);
      });
    });



    // Draw vertical walls

    verticals.forEach((row, rowIndex) => {
      row.forEach((open, columnIndex) => {
        if(open) {
          return;
        }
    
        const wall = Bodies.rectangle(
          columnIndex * unitLengthX + unitLengthX,
          rowIndex * unitLengthY + unitLengthY / 2,
          borderWidth,
          unitLengthY,
          {
            label: 'wall',
            isStatic: true,
            render: {
              fillStyle: wallColor
            }
          }
        );
        World.add(world, wall);
      });
    });


    // Setup goal
    const goal = Bodies.rectangle(
      width - unitLengthX / 2,
      height - unitLengthY / 2,
      unitLengthX * .7,
      unitLengthY * .7,
      {
        isStatic: true,
        label: 'goal',
        render: {
          fillStyle: '#6eef47'
        }
      }
    )
    World.add(world, goal);

    // Setup ball
    const ballRadius = Math.min(unitLengthX, unitLengthY) * .35;
    const ball = Bodies.circle(
      unitLengthX / 2,
      unitLengthY / 2,
      ballRadius, 
      {
        label: 'ball',
        render: {
          fillStyle: '#ef476f'
        }
      }
    )

    World.add(world, ball);

    const { x, y } = ball.velocity;
      const speed = setSpeed;

    kd.W.down(function () {
      Body.setVelocity(ball, {x, y: y - speed });
    });

    kd.S.down(function () {
      Body.setVelocity(ball, {x, y: y + speed });
    });

    kd.A.down(function () {
      Body.setVelocity(ball, {x: x - speed, y });
    });

    kd.D.down(function () {
      Body.setVelocity(ball, {x: x + speed, y });
    });
    
    // This update loop is the heartbeat of Keydrown
    kd.run(function () {
      kd.tick();
    });

    // Start timer + instructions
    const instructions = document.querySelector('.instructions');
    instructions.classList.remove('hidden');
    let timerId;
    let timer = 0;
    document.addEventListener('keydown', (event) => {
      if(event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd') {
        if(!instructions.classList.contains('hidden')) {
          timerId = setInterval(() => {
            timer += 0.01;
            document.querySelector('#timer').innerHTML = `Time: ${timer.toFixed(2)}`;
          }, 10);
        }
        instructions.classList.add('hidden');
        document.querySelector('#timer').classList.remove('hidden');
      }
    });

    // Win Condition
    let highscores = [];
    const highscoreDisplay = document.querySelectorAll('.highscore');
    const winner = document.querySelector('.winner');

    function sortNumbers(a, b) {
      return a - b;
    }

    Events.on(engine, 'collisionStart', event => {
      event.pairs.forEach(collision => {
        const labels = ['ball', 'goal'];

        if(labels.includes(
          collision.bodyA.label) && 
          labels.includes(collision.bodyB.label)) {
          world.gravity.y = 1;
          world.bodies.forEach((item) => {
            if(item.label === 'wall'){
              Body.setStatic(item, false);
            }
          });
          if(winner.classList.contains('hidden')){
            document.querySelector('#winTimeDisplay').innerHTML = `Your Time: <span id="winTime">${timer.toFixed(2)}</span> seconds`
            clearInterval(timerId);
            highscores.push(timer.toFixed(2));
            highscores.sort(sortNumbers);
            timer = 0;
            highscoreDisplay.forEach((el, index) => {
              if(highscores[index]) {
                el.innerHTML = `\u00A0\u00A0\u00A0\u00A0\u00A0${highscores[index]}`;
              } 
            });
          }

          winner.classList.remove('hidden');
        }
      });
    });

  }
  init();

  document.querySelector('#playAgain').addEventListener('click', (event) => {
    World.clear(world, engine);
    engine.world.gravity.y = 0;
    document.querySelector('.winner').classList.add('hidden');
    init();
  });

  document.querySelector('#backHome').addEventListener('click', () => {
    location.reload();
  });


}


