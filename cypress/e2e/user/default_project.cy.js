const PATH_API = '/User/DefaultProject'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('Auth Default Project - /auth/default_project', () => {

  it('Status Code: 200', () => {
    setDefaultProject({ token: validToken, updated_project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    setDefaultProject({ updated_project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    setDefaultProject({ token: 'token_invalido', updated_project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 401, 403', () => {
    setDefaultProject({ token: 'token_expirado', updated_project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    setDefaultProject({ token: null, updated_project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    setDefaultProject({ token: '😀🔥💥', updated_project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    setDefaultProject({ token: "' OR 1=1 --", updated_project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 422, 404', () => {
    setDefaultProject({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Status Code: 404, 422, 400', () => {
    setDefaultProject({ token: validToken, updated_project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    setDefaultProject({ token: validToken, updated_project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, updated_project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    setDefaultProject({ token: "' OR 1=1 --", updated_project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    setDefaultProject({ token: validToken, updated_project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      setDefaultProject({ token: validToken, updated_project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    setDefaultProject({ token: validToken, updated_project_id: validProjectId })
      .then(() => setDefaultProject({ token: validToken, updated_project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});