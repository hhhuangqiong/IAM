import { NotFoundError } from 'common-errors';
import Joi from 'joi';

const idRegExp = /^[0-9a-fA-F]{24}$/;
export function logoService(validator, { Company }, storage) {
  // helper function to get company
  function* findOneCompany(id) {
    const company = yield Company.findOne({ _id: id });
    if (!company) {
      throw new NotFoundError('company');
    }
    return company;
  }

  const getLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  function* getLogo(command) {
    const sanitizedCommand = validator.sanitize(command, getLogoCommandSchema);
    const imageBuffer = yield storage.getFile(sanitizedCommand.id);
    return imageBuffer;
  }

  const deleteLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  function* deleteLogo(command) {
    const sanitizedCommand = validator.sanitize(command, deleteLogoCommandSchema);
    const company = yield findOneCompany(sanitizedCommand.id);
    if (!company.logo) {
      throw new NotFoundError('company logo');
    }
    yield storage.removeFile(company.logo);
    // unlink the logo field
    company.logo = undefined;
    yield company.save();
  }

  const createLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
    logo: Joi.object().required(),
  });

  function* createLogo(command) {
    const sanitizedCommand = validator.sanitize(command, createLogoCommandSchema);
    const file = command.logo;
    const company = yield findOneCompany(sanitizedCommand.id);
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
