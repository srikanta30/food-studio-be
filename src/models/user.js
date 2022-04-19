const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true, minlength: 8},
    role: {type: String, required: true, trim: true},
}, {
    versionKey: false,
    timestamps: true
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password')) {
        return next();
    }

    const hash = bcryptjs.hashSync(this.password, 8);
    this.password = hash;
    return next();
})

userSchema.methods.checkPassword = function(password) {
    const match = bcryptjs.compareSync(password, this.password);
    return match;
}

const Users = new mongoose.model('users', userSchema);

module.exports = Users;