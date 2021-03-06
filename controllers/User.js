const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.register = async (req, res, next) => {
	if (!req.body.username || !req.body.password)
		return res.status(400).send({
			message: 'Must specify username, password'
		})
	
	let user = new User({
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, 8)
	})

	await user.save()
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not created'
			})
		}
		req.body.id = user._id
		next()
	}).catch((err) => {
		return res.status(500).send({
			message: err.message || 'Some error occurred while creating the User.'
		})
	})
}

exports.login = async (req, res, next) => {
	if (!req.body.username || !req.body.password)
		return res.status(400).send({
			message: 'Must specify username, password'
		})

	await User.findOne({username: req.body.username})
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		bcrypt.compare(req.body.password, user.password, (err, success) => {
			if (err)
				throw err
			if (!success)
				return res.status(404).send({
					message: 'Wrong password'
				})
			req.body.id = user._id
			next()
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while login the User'
		})
	})
}

exports.findById = async (req, res) => {
	if (!req.user.id)
		return res.status(400).send({
			message: 'ID not specified'
		})

	await User.findById(req.user.id, {__v: 0, password: 0, _id: 0})
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		res.status(200).send({
			data: user
		})
	}).catch((err) => {
		res.status(500).send({
			message: err.message || 'Some error occurred while finding the User'
		})
	})
}

exports.update = async (req, res) => {
	let data = {}
	if (req.body.password)
		data.password = bcrypt.hashSync(req.body.password, 8)
	if (req.body.username)
		data.username = req.body.username
	
	await User.findByIdAndUpdate(req.user.id, {$set: data})
	.then(user => {
		if (!user)
			return res.status(404).send({
				message: 'User not found'
			})
		res.status(200).send({
			message: 'User correctly updated'
		})
	}).catch(err => {
		if (err.kind === 'ObjectId') {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		res.status(500).send({
			message: err.message || 'Error updating user'
		})
	})
}

exports.delete = async (req, res) => {
	if (!req.user.id)
		return res.status(400).send({
			message: 'ID not specified'
		})
	
	await User.findByIdAndDelete(req.user.id)
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		res.status(200).send({
			message: 'User deleted'
		})
	}).catch(err => {
		res.status(500).send({
			message: err.message || ('Can\'t delete user with id ' + req.user.id)
		})
	})
}

exports.goPublisher = async (req, res) => {
	let publishers = 0
	await User.countDocuments({role: 'publisher'}).then(total => {
		publishers = total
	})
	await User.findById(req.user.id)
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		if (publishers === 0) {
			user.role = (user.role === 'visitor') ? 'publisher' : 'visitor'
			return user.save()
		} else 
			return new Error('Can\'t make yourself a publisher')
	}).then(user => {
		res.status(200).send({
			message: (user.username + ' has now a ' + user.role + ' role')
		})
	}).catch(err => {
		res.status(500).send({
			message: err.message || 'Can\'t change the role'
		})
	})
}

exports.makePublisher = async (req, res) => {
	await User.findById(req.user.id)
	.then((user) => {
		if (!user) {
			return res.status(404).send({
				message: 'User not found'
			})
		}
		if (user.role === 'publisher') {
			return User.findById(req.query.id).then((newUser) => {
				newUser.role = (newUser.role === 'visitor') ? 'publisher' : 'visitor'
				return newUser.save()
			})
		}
		return new Error('You can\'t change the role of another user')
	}).then(user => {
		res.status(200).send({
			message: (user.username + ' has now a ' + user.role + ' role')
		})
	}).catch(err => {
		res.status(500).send({
			message: err.message || 'Can\'t change the role'
		})
	})
}