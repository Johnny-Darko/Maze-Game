const easy = [10, 6, 10];
const medium = [16, 9, 8];
const hard = [25, 14, 6];

const difOptions = document.querySelectorAll('.difficultyImg');


for(let item of difOptions) {
  item.addEventListener('click', () => {
    document.querySelector('.container').classList.add('hidden');
    if(item.id === 'easy') {
      startGame(easy);
    }
    if(item.id === 'medium') {
      startGame(medium);
    }
    if(item.id === 'hard') {
      startGame(hard);
    }
  });
};



