import { NotFoundError } from 'common-errors';
import Joi from 'joi';

export function logoService(validator, { Company }, storage) {
  const getLogoCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* getLogo(command) {
    const sanitizedCommand = validator.sanitize(command, getLogoCommandSchema);
    const imageBuffer = yield storage.getFile(sanitizedCommand.id);
    return imageBuffer;
  }

  const deleteLogoCommandSchema = Joi.object({
    id: Joi.string().required(),
  });

  function* deleteLogo(command) {
    const sanitizedCommand = validator.sanitize(command, deleteLogoCommandSchema);
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    if (!company) {
      throw new NotFoundError('company');
    }
    if (!company.logo) {
      throw new NotFoundError('company logo');
    }
    yield storage.removeFile(company.logo);
    // unlink the logo field
    company.logo = undefined;
    yield company.save();
  }

  const createLogoCommandSchema = Joi.object({
    id: Joi.string().required(),
    logo: Joi.object().required(),
  });

  function* createLogo(command) {
    const sanitizedCommand = validator.sanitize(command, createLogoCommandSchema);
    const file = command.logo;
    const company = yield Company.findOne({ _id: sanitizedCommand.id });
    if (!company) {
      throw new NotFoundError('company');
    }
    // remove the previous logo
    if (company.logo) {
      yield storage.removeFile(company.logo);
    }
    const logoDoc = yield storage.addFile(file.path, {
      mimeType: file.mimetype,
      filename: file.originalname,
      unlinkFile: true,
    });
    company.logo = logoDoc._id;
    yield company.save();
    return company.logo;
  }

  return {
    createLogo,
    getLogo,
    deleteLogo,
  };
}
