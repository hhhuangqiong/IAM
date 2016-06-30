import expressApp from '../src/express';
import koaApp from '../src/koa';
import request from 'supertest';

export const accessAgent = request.agent(expressApp);
export const identityAgent = request.agent(expressApp);
export const openidAgent = request.agent(koaApp);
