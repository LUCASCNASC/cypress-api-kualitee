const PATH_API = '/Project/ProjectMetasDelete';
const validToken = Cypress.env('VALID_TOKEN');

const validMetaId = 123;

describe('Project Metas Delete - /project/metas/delete', () => {

  it('Status Code is 200', () => {
    metasDelete({ token: validToken, meta_id: validMetaId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasDelete({ meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasDelete({ token: 'token_invalido', meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 401, 403', () => {
    metasDelete({ token: 'token_expirado', meta_id: validMetaId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {
    metasDelete({ token: null, meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem meta_id', () => {
    metasDelete({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com meta_id inexistente', () => {
    metasDelete({ token: validToken, meta_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    metasDelete({ token: validToken, meta_id: validMetaId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, meta_id: validMetaId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasDelete({ token: "' OR 1=1 --", meta_id: validMetaId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    metasDelete({ token: validToken, meta_id: validMetaId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      metasDelete({ token: validToken, meta_id: validMetaId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    metasDelete({ token: validToken, meta_id: validMetaId })
      .then(() => metasDelete({ token: validToken, meta_id: validMetaId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});