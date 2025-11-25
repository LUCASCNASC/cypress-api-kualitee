const PATH_API = '/Project/ProjectMetasDelete';
const validToken = Cypress.env('VALID_TOKEN');

const validMetaId = 123;

describe('API - Project Metas Delete - /project/metas/delete', () => {

  function metasDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Deleta meta de projeto com token e meta_id válidos', () => {
    metasDelete({ token: validToken, meta_id: validMetaId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    metasDelete({ meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    metasDelete({ token: 'token_invalido', meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    metasDelete({ token: 'token_expirado', meta_id: validMetaId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    metasDelete({ token: null, meta_id: validMetaId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- meta_id inválido, ausente, tipos errados, limites ---
  it('Falha sem meta_id', () => {
    metasDelete({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(meta_id => {
    it(`Falha com meta_id inválido (${JSON.stringify(meta_id)})`, () => {
      metasDelete({ token: validToken, meta_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com meta_id inexistente', () => {
    metasDelete({ token: validToken, meta_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    metasDelete({ token: validToken, meta_id: validMetaId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, meta_id: validMetaId },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
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

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    metasDelete({ token: "' OR 1=1 --", meta_id: validMetaId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    metasDelete({ token: validToken, meta_id: validMetaId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      metasDelete({ token: validToken, meta_id: validMetaId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    metasDelete({ token: validToken, meta_id: validMetaId })
      .then(() => metasDelete({ token: validToken, meta_id: validMetaId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});