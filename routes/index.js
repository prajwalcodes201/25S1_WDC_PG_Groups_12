var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

router.get('/trivia', async (req, res) => {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=50');
    const data = await response.json();
    const questionData = data.results[0];

    res.json({
      question: questionData.question,
      correct_answer: questionData.correct_answer,
      options: shuffle([
        ...questionData.incorrect_answers,
        questionData.correct_answer
      ])
    });
  } catch (error) {
    res.status(500).send('Failed to fetch trivia');
  }
});

module.exports = router;
