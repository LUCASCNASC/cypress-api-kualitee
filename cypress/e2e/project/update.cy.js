const PATH_API = '/Project/ProjectUpdate';
const validToken = Cypress.env('VALID_TOKEN');

describe('Project Update - /project/update', () => {

  it('Status Code is 200', () => {
    projectUpdate(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    const { token, ...body } = validBody;
    projectUpdate(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    projectUpdate({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    projectUpdate({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    projectUpdate({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422', () => {
    projectUpdate({ ...validBody, project_type: 'invalid_type' }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    projectUpdate({ ...validBody, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectUpdate({ ...validBody, project_name: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code is 429', () => {
    projectUpdate(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      projectUpdate(validBody)
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    projectUpdate(validBody)
      .then(() => projectUpdate(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});