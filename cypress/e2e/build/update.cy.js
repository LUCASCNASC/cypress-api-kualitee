const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Build/BuildsUpdate';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validStartDate = Cypress.env('VALID_START_DATE');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validId = Cypress.env('VALID_ID');

const validEndDate = '2020-06-02';
const validDescription = 'Atualização de build';

describe('API - Builds Update - /build/update', () => {

  function buildUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  it('Atualiza build do projeto com todos os campos válidos', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    buildUpdate({
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    buildUpdate({
      token: 'token_invalido',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    buildUpdate({
      token: 'token_expirado',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    buildUpdate({
      token: null,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'start_date', 'end_date', 'build_id', 'id', 'description'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      };
      delete body[field];
      buildUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', {}, [], true, false].forEach(invalidValue => {
    ['start_date', 'end_date', 'description'].forEach(field => {
      it(`Falha com ${field} inválido (${JSON.stringify(invalidValue)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          start_date: validStartDate,
          end_date: validEndDate,
          build_id: validBuildId,
          id: validId,
          description: validDescription
        };
        body[field] = invalidValue;
        buildUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      buildUpdate({
        token: validToken,
        project_id,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id,
        id: validId,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription,
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
          start_date: validStartDate,
          end_date: validEndDate,
          build_id: validBuildId,
          id: validId,
          description: validDescription
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
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    })
      .then(() => buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});