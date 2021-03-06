const express = require('express')
const router = express.Router()

const Card = require('../controllers/Card')
const AccessToken = require('../modules/AccessToken')

/* [GET] Return a gallery [order by page] */
router.get('/gallery', Card.findByPage)

/* [GET] Return a card */
router.get('/card/:card_id', Card.findById)

/* [POST] Post card */
router.post('/card', AccessToken.verify, AccessToken.isPublisher, Card.save)

/* [PUT] Edit card with id 'card_id' */
router.put('/card/:card_id', AccessToken.verify, AccessToken.isPublisher, Card.update)

/* [DELETE] Remove card with id 'card_id' */
router.delete('/card/:card_id', AccessToken.verify, AccessToken.isPublisher, Card.delete)

/* [POST] Like or unlike card with id 'card_id' */
//router.post('/card/:card_id/favorite', AccessToken.verify, Card.favorite)

module.exports = router