const PATH_API = '/Project/ProjectMetasMetasCreate'
const validToken = Cypress.env('VALID_TOKEN');

describe('API - Project Metas Create - /project/metas/create', () => {
  const validMetaKey = 'meta_key_exemplo';
  const validMetaValue = 'meta_value_exemplo';

  function metasCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Cria meta de projeto com todos os campos válidos', () => {
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

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    metasCreate({
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    metasCreate({
      token: 'token_invalido',
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    metasCreate({
      token: 'token_expirado',
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    metasCreate({
      token: null,
      meta_key: validMetaKey,
      meta_value: validMetaValue
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['meta_key', 'meta_value'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue
      };
      delete body[field];
      metasCreate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios vazios/inválidos ---
  ['meta_key', 'meta_value'].forEach(field => {
    [null, '', {}, [], true, false, 12345].forEach(invalidValue => {
      it(`Falha com ${field} inválido (${JSON.stringify(invalidValue)})`, () => {
        const body = {
          token: validToken,
          meta_key: validMetaKey,
          meta_value: validMetaValue
        };
        body[field] = invalidValue;
        metasCreate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    metasCreate({
      token: validToken,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      extra: 'foo'
    }).then(response => {
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
        body: {
          token: validToken,
          meta_key: validMetaKey,
          meta_value: validMetaValue
        },
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

  // --- Contrato: Não vazar informações sensíveis ---
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

  // --- Headers ---
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

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
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

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
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