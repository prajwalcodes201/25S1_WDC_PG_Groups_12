var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/trivia', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
    const questionData = response.data.results[0];

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

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

module.exports = router;
