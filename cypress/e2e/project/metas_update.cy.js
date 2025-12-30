const PATH_API = '/Project/ProjectMetasUpdate';
const validToken = Cypress.env('VALID_TOKEN');

const validMetaKey = 'meta_key_exemplo';
const validMetaValue = 'meta_value_exemplo';
const validMetaId = 123;

describe('Project Metas Update - /project/metas/update', () => {

  it('Status Code is 200', () => {
    metasUpdate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasUpdate({
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasUpdate({
      token: 'token_invalido',
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    metasUpdate({
      token: 'token_expirado',
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasUpdate({
      token: null,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com meta_id inexistente', () => {
    metasUpdate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: 999999
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    metasUpdate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId,
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
        meta_value: validMetaValue,
        meta_id: validMetaId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasUpdate({
      token: "' OR 1=1 --",
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    metasUpdate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      metasUpdate({
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue,
        meta_id: validMetaId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    metasUpdate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    })
      .then(() => metasUpdate({
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue,
        meta_id: validMetaId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});