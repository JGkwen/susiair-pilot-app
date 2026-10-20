import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports that the service is up', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
