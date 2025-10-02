describe('API - Builds Delete - /build/delete', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validBuildId = 10; // Substitua por um id de build válido do seu ambiente
  const PATH_API = '/Build/BuildsDelete'

  function buildDelete(body, options = {}) {
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
  it('Deleta build do projeto com token, project_id e build_id válidos', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    buildDelete({
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    buildDelete({
      token: 'token_invalido',
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    buildDelete({
      token: 'token_expirado',
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    buildDelete({
      token: null,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id/build_id inválidos, ausentes, tipos errados, limites ---
  it('Falha sem project_id', () => {
    buildDelete({
      token: validToken,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem build_id[0]', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      buildDelete({
        token: validToken,
        project_id,
        'build_id[0]': validBuildId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id[0] inválido (${JSON.stringify(build_id)})`, () => {
      buildDelete({
        token: validToken,
        project_id: validProjectId,
        'build_id[0]': build_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    buildDelete({
      token: validToken,
      project_id: 999999,
      'build_id[0]': validBuildId
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Falha com build_id[0] inexistente', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': 999999
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId,
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
          project_id: validProjectId,
          'build_id[0]': validBuildId
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
        project_id: validProjectId,
        'build_id[0]': validBuildId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      buildDelete({
        token: validToken,
        project_id: validProjectId,
        'build_id[0]': validBuildId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    buildDelete({
      token: validToken,
      project_id: validProjectId,
      'build_id[0]': validBuildId
    })
      .then(() => buildDelete({
        token: validToken,
        project_id: validProjectId,
        'build_id[0]': validBuildId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});