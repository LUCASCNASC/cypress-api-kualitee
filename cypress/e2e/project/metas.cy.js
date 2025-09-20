describe('API - Project Metas - /project/metas', () => {
  const validToken = 'token_valido_aqui';
  const validMetaType = 'exemplo'; // Substitua pela string válida para meta_type

  function projectMetas(queryParams, options = {}) {
    return cy.request({
      method: 'GET',
      url: `${BASE_URL}/Project/ProjectMetas`,
      qs: queryParams,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna metas do projeto com token e meta_type válidos', () => {
    projectMetas({ token: validToken, meta_type: validMetaType }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    projectMetas({ meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    projectMetas({ token: 'token_invalido', meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    projectMetas({ token: 'token_expirado', meta_type: validMetaType }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    projectMetas({ token: null, meta_type: validMetaType }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- meta_type inválido, ausente, tipos errados, limites ---
  it('Falha sem meta_type', () => {
    projectMetas({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', {}, [], true, false, 12345].forEach(meta_type => {
    it(`Falha com meta_type inválido (${JSON.stringify(meta_type)})`, () => {
      projectMetas({ token: validToken, meta_type }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra nos parâmetros', () => {
    projectMetas({ token: validToken, meta_type: validMetaType, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['POST', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Project/ProjectMetas`,
        qs: { token: validToken, meta_type: validMetaType },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'GET',
      url: `${BASE_URL}/Project/ProjectMetas`,
      qs: { token: validToken, meta_type: validMetaType },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415, 200]).to.include(response.status); // algumas APIs aceitam, outras não
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectMetas({ token: "' OR 1=1 --", meta_type: validMetaType }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    projectMetas({ token: validToken, meta_type: validMetaType }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      projectMetas({ token: validToken, meta_type: validMetaType })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    projectMetas({ token: validToken, meta_type: validMetaType })
      .then(() => projectMetas({ token: validToken, meta_type: validMetaType }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});