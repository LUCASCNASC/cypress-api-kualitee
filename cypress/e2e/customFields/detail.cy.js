const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Custom%20Fields/detail';

const validId = Cypress.env('VALID_ID');

describe('API rest - Custom Fields - Custom Fields Detail - /customfields/detail', () => {

  it('Status Code 200', () => {
    customfieldsDetail({ token: validToken, id: validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    customfieldsDetail({ id: validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem id', () => {
    customfieldsDetail({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra na query', () => {
    customfieldsDetail({ token: validToken, id: validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    customfieldsDetail({ token: "' OR 1=1 --", id: validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    customfieldsDetail({ token: validToken, id: validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsDetail({ token: validToken, id: validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    customfieldsDetail({ token: validToken, id: validId })
      .then(() => customfieldsDetail({ token: validToken, id: validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});