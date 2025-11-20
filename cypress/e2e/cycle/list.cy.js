const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/List';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');
const validTestScenarioId = 33;
const validDefect = 'defeito01';
const validKeyword = 'login';
const validOS = 'Windows';
const validBrowser = 'Chrome';
const validAssignTo = [123, 456];
const validStatus = ['Open', 'Closed'];
const validCreatedBy = [789];
const validSeverity = 'High';
const validBugType = 'UI';
const validDefectViewers = 321;
const validDevice = 'iPhone 13';
const validExport = 'yes';
const validExportType = 'Excel';

describe('API - Defects List - /defects/list', () => {

  function defectsList(body, options = {}) {
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
  it('Lista defeitos com campos obrigatórios mínimos', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Lista defeitos com todos os filtros preenchidos', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      test_scenario_id: validTestScenarioId,
      defects: validDefect,
      keyword: validKeyword,
      os: validOS,
      browser: validBrowser,
      assignto: validAssignTo,
      status: validStatus,
      created_by: validCreatedBy,
      severity: validSeverity,
      bugtype: validBugType,
      defect_viewers: validDefectViewers,
      device: validDevice,
      export: validExport,
      export_type: validExportType
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    defectsList({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsList({
        token,
        project_id: validProjectId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  it('Falha sem project_id', () => {
    defectsList({
      token: validToken
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsList({
        token: validToken,
        project_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos opcionais inválidos ---
  const invalidArray = [null, '', 'abc', 0, -1, {}, true, false];
  ['build_id', 'module_id', 'test_scenario_id', 'defect_viewers'].forEach(field => {
    invalidArray.forEach(value => {
      it(`Falha com campo opcional ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
        };
        body[field] = value;
        defectsList(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // Array e tipos alternativos para os arrays opcionais
  [null, '', 'abc', {}, true, false].forEach(value => {
    ['assignto', 'status', 'created_by'].forEach(field => {
      it(`Falha com campo ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
        };
        body[field] = value;
        defectsList(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Exportação ---
  it('Exporta lista de defeitos para CSV', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      export: 'yes',
      export_type: 'CSV'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Exporta lista de defeitos para Excel', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      export: 'yes',
      export_type: 'Excel'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Exporta lista de defeitos para Word', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      export: 'yes',
      export_type: 'Word'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      foo: 'bar'
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
          project_id: validProjectId
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
        project_id: validProjectId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsList({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsList({
        token: validToken,
        project_id: validProjectId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId
    }).then(() =>
      defectsList({
        token: validToken,
        project_id: validProjectId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});