const PATH_API = '/Project/ProjectMetasMetasCreate';
const validToken = Cypress.env('VALID_TOKEN');

const validMetaKey = 'meta_key_exemplo';
const validMetaValue = 'meta_value_exemplo';

describe('Project Metas Create - /project/metas/create', () => {

  it('Status Code is 200', () => {
    metasCreate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasCreate({
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasCreate({
      token: 'token_invalido',
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    metasCreate({
      token: 'token_expirado',
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasCreate({
      token: null,
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    metasCreate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasCreate({
      token: "' OR 1=1 --",
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    metasCreate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      metasCreate({
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    metasCreate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue
    })
      .then(() => metasCreate({
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});