const PATH_API = '/Project/ProjectCreate';
const validToken = Cypress.env('VALID_TOKEN');

describe('Project Create - /project/create', () => {

  it('Status Code are 200', () => {
    projectCreate(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    const { token, ...body } = validBody;
    projectCreate(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    projectCreate({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 401, 403', () => {
    projectCreate({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    projectCreate({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422', () => {
    projectCreate({ ...validBody, project_type: 'invalid_type' }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    projectCreate({ ...validBody, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
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
    projectCreate({ ...validBody, project_name: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code are 429', () => {
    projectCreate(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      projectCreate(validBody)
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    projectCreate(validBody)
      .then(() => projectCreate(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});