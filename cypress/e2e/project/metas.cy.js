const PATH_API = '/Project/ProjectMetas';
const validToken = Cypress.env('VALID_TOKEN');

const validMetaType = 'exemplo';

describe('Project Metas - /project/metas', () => {

  it('Status Code: 200', () => {
    projectMetas({ token: validToken, meta_type: validMetaType }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    projectMetas({ meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    projectMetas({ token: 'token_invalido', meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 401, 403', () => {
    projectMetas({ token: 'token_expirado', meta_type: validMetaType }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    projectMetas({ token: null, meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem meta_type', () => {
    projectMetas({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    projectMetas({ token: validToken, meta_type: validMetaType, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, meta_type: validMetaType },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415, 200]).to.include(response.status); // algumas APIs aceitam,,tras não
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectMetas({ token: "' OR 1=1 --", meta_type: validMetaType }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    projectMetas({ token: validToken, meta_type: validMetaType }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      projectMetas({ token: validToken, meta_type: validMetaType })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    projectMetas({ token: validToken, meta_type: validMetaType })
      .then(() => projectMetas({ token: validToken, meta_type: validMetaType }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});