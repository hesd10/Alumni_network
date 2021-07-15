const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean != value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.alumniSchema = Joi.object({
    profile: Joi.object({
        first_name: Joi.string().required().escapeHTML(),
        last_name: Joi.string().required().escapeHTML(),
        email: Joi.string().allow('').email(),
        // dob: Joi.date().allow('').iso(),
        dob: Joi.object({
            year: Joi.number().integer().min(1900).max(2100).required(),
            month: Joi.number().integer().min(1).max(12).required(),
            day: Joi.number().integer().min(1).max(31).required()
        }),
        hometown: Joi.object({
            country: Joi.string().allow('').escapeHTML(),
            state: Joi.string().allow('').escapeHTML(),
            city: Joi.string().allow('').escapeHTML()
        }),
        present: Joi.object({
            country: Joi.string().allow('').escapeHTML(),
            state: Joi.string().allow('').escapeHTML(),
            city: Joi.string().allow('').escapeHTML()
        }),
        job: Joi.object({
            company: Joi.string().allow('').escapeHTML(),
            position: Joi.string().allow('').escapeHTML()
        }),
        ismarried: Joi.number().min(0).max(1),
        phone: Joi.string().allow('').escapeHTML()
    }).required()
});

module.exports.photoSchema = Joi.object({
    photo: Joi.object({
        description: Joi.string().allow('').escapeHTML(),
        accessibility: Joi.string().valid('Global', 'OnlyToAlumni')
    }).required()
});

module.exports.photoCommentSchema = Joi.object({
    comment: Joi.object({
        content: Joi.string().escapeHTML()
    }).required()
});
