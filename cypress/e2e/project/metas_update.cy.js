describe('API - Project Metas Update - /project/metas/update', () => {
  const validToken = 'token_valido_aqui';
  const validMetaKey = 'meta_key_exemplo';
  const validMetaValue = 'meta_value_exemplo';
  const validMetaId = 123; // Substitua por um id de meta válido do seu ambiente

  function metasUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: '/Project/ProjectMetasUpdate',
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Atualiza meta de projeto com todos os campos válidos', () => {
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

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    metasUpdate({
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    metasUpdate({
      token: 'token_invalido',
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    metasUpdate({
      token: 'token_expirado',
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    metasUpdate({
      token: null,
      meta_key: validMetaKey,
      meta_value: validMetaValue,
      meta_id: validMetaId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['meta_key', 'meta_value', 'meta_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue,
        meta_id: validMetaId
      };
      delete body[field];
      metasUpdate(body).then(response => {
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
          meta_value: validMetaValue,
          meta_id: validMetaId
        };
        body[field] = invalidValue;
        metasUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(meta_id => {
    it(`Falha com meta_id inválido (${JSON.stringify(meta_id)})`, () => {
      metasUpdate({
        token: validToken,
        meta_key: validMetaKey,
        meta_value: validMetaValue,
        meta_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
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

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
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

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: '/Project/ProjectMetasUpdate',
        form: true,
        body: {
          token: validToken,
          meta_key: validMetaKey,
          meta_value: validMetaValue,
          meta_id: validMetaId
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
      url: '/Project/ProjectMetasUpdate',
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

  // --- Contrato: Não vazar informações sensíveis ---
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

  // --- Headers ---
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

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
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

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
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