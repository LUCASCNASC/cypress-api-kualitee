const PATH_API = '/Requirement/BulkUpdate';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');
const validRequirementIds = [101, 102, 103];

describe('API - Requirements Bulk Update - /requirements/bulkupdate', () => {

  // Função utilitária para chamada da API
  function bulkUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  
  it('Atualiza em lote requisitos com todos os campos obrigatórios válidos', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza lote com múltiplos requirements', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      'requirement_id[2]': validRequirementIds[2],
      module_id: validModuleId
    }).then(response => {
      expect([200, 400, 422]).to.include(response.status);
    });
  });

  // --- NEGATIVO: AUTH ---
  it('Falha sem token', () => {
    bulkUpdate({
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      bulkUpdate({
        token,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'requirement_id[0]', 'requirement_id[1]', 'module_id'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      };
      delete body[field];
      bulkUpdate(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  [
    { field: 'project_id', valid: validProjectId },
    { field: 'requirement_id[0]', valid: validRequirementIds[0] },
    { field: 'requirement_id[1]', valid: validRequirementIds[1] },
    { field: 'module_id', valid: validModuleId }
  ].forEach(({ field, valid }) => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          'requirement_id[0]': validRequirementIds[0],
          'requirement_id[1]': validRequirementIds[1],
          module_id: validModuleId
        };
        body[field] = value;
        bulkUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId,
      foo: 'bar'
    }).then(response => {
      expect([200, 400]).to.include(response.status);
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
          'requirement_id[0]': validRequirementIds[0],
          'requirement_id[1]': validRequirementIds[1],
          module_id: validModuleId
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
      url:`/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    bulkUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      bulkUpdate({
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    bulkUpdate({
      token: validToken,
      project_id: validProjectId,
      'requirement_id[0]': validRequirementIds[0],
      'requirement_id[1]': validRequirementIds[1],
      module_id: validModuleId
    })
      .then(() => bulkUpdate({
        token: validToken,
        project_id: validProjectId,
        'requirement_id[0]': validRequirementIds[0],
        'requirement_id[1]': validRequirementIds[1],
        module_id: validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});