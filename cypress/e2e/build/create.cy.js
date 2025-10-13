describe('API - Builds Create - /build/create', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validStartDate = Cypress.env('VALID_START_DATE');
  const validEndDate = '2020-06-02';
  const validBuildName = 'Build v1.2.3';
  const validBuildDescription = 'Descrição do build de testes automáticos.';
  const PATH_API = '/Build/BuildsCreate'

  function buildCreate(body, options = {}) {
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
  it('Cria build com todos os campos válidos', () => {
    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    buildCreate({
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    buildCreate({
      token: 'token_invalido',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    buildCreate({
      token: 'token_expirado',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    buildCreate({
      token: null,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'start_date', 'end_date', 'build_name', 'build_description'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      };
      delete body[field];
      buildCreate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', {}, [], true, false].forEach(invalidValue => {
    ['start_date', 'end_date', 'build_name', 'build_description'].forEach(field => {
      it(`Falha com ${field} inválido (${JSON.stringify(invalidValue)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          start_date: validStartDate,
          end_date: validEndDate,
          build_name: validBuildName,
          build_description: validBuildDescription
        };
        body[field] = invalidValue;
        buildCreate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      buildCreate({
        token: validToken,
        project_id,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription,
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
        url: '/Build/BuildsCreate',
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          start_date: validStartDate,
          end_date: validEndDate,
          build_name: validBuildName,
          build_description: validBuildDescription
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
      url: '/Build/BuildsCreate',
      body: {
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildCreate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      buildCreate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    })
      .then(() => buildCreate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});