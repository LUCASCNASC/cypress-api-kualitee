const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Integration/detail';

const validId = Cypress.env('VALID_ID');

describe('Integration - Integration Detail - /integration/detail', () => {

  it('Status Code are 200', () => {
    integrationDetail({ token: validToken, id: validId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    integrationDetail({ id: validId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 404', () => {
    integrationDetail({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    integrationDetail({ token: validToken, id: validId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, id: validId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    integrationDetail({ token: "' OR 1=1 --", id: validId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code are 429', () => {
    integrationDetail({ token: validToken, id: validId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      integrationDetail({ token: validToken, id: validId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Status Code are 200, 400, 401, 409', () => {
    integrationDetail({ token: validToken, id: validId })
      .then(() => integrationDetail({ token: validToken, id: validId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});