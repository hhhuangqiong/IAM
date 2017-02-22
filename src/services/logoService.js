import { NotFoundError } from 'common-errors';
import { check } from 'm800-util';
import Joi from 'joi';

import { validator } from './util';

const idRegExp = /^[0-9a-fA-F]{24}$/;
export function logoService(Company, gridFsStorage) {
  check.ok('Company', Company);
  check.ok('gridFsStorage', gridFsStorage);
  // helper function to get company
  async function findOneCompany(id) {
    const company = await Company.findOne({ _id: id });
    if (!company) {
      throw new NotFoundError('company');
    }
    return company;
  }

  const getLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  async function getLogo(command) {
    const sanitizedCommand = validator.sanitize(command, getLogoCommandSchema);
    const imageObject = await gridFsStorage.getFile(sanitizedCommand.id);
    return imageObject;
  }

  const deleteLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
  });

  async function deleteLogo(command) {
    const sanitizedCommand = validator.sanitize(command, deleteLogoCommandSchema);
    const company = await findOneCompany(sanitizedCommand.id);
    if (!company.logo) {
      throw new NotFoundError('company logo');
    }
    await gridFsStorage.removeFile(company.logo);
    // unlink the logo field
    company.logo = undefined;
    await company.save();
  }

  const createLogoCommandSchema = Joi.object({
    id: Joi.string().regex(idRegExp).required(),
    logo: Joi.object().required(),
  });

  async function createLogo(command) {
    const sanitizedCommand = validator.sanitize(command, createLogoCommandSchema);
    const file = command.logo;
    const company = await findOneCompany(sanitizedCommand.id);
    if (!company) {
      throw new NotFoundError('company');
    }
    // remove the previous logo
    if (company.logo) {
      await gridFsStorage.removeFile(company.logo);
    }
    const logoDoc = await gridFsStorage.addFile(file.path, {
      mimeType: file.mimetype,
      filename: file.originalname,
      unlinkFile: true,
    });
    company.logo = logoDoc._id;
    await company.save();
    return company.logo;
  }

  return {
    createLogo,
    getLogo,
    deleteLogo,
  };
}

export default logoService;
