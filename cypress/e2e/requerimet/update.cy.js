const PATH_API = '/Requirement/update';
const validToken = Cypress.env('VALID_TOKEN')

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validRequirementId = 123;
const validAssignedTo = 111;
const validTitle = 'Título do requisito';
const validSummary = 'Resumo do requisito';

describe('API rest - Requirements Update - /requirements/update', () => {

  // Dados opcionais válidos
  const optionalFields = {
    build_id: 1,
    requirement_parent_id: 2,
    test_scenarios: 'Cenário 1; Cenário 2',
    test_cases: 'Caso 1; Caso 2',
    requirement_type: 'Funcional',
    requirement_class: 'Alta',
    requirement_source: 'Cliente',
    impact_identification: 'Alto impacto',
    comments: 'Comentário exemplo',
    status: 'Ativo'
  };

  // Função utilitária para chamada da API
  function requirementsUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Status Code 200', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza requirement com todos os campos preenchidos', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo,
      ...optionalFields
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success');
    });
  });

  it('Atualiza requirement com envio de arquivo (attachment)', () => {
    cy.fixture('arquivo_teste.txt', 'base64').then(fileContent => {
      requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo,
        'attachment[]': {
          fileContent,
          fileName: 'arquivo_teste.txt',
          mimeType: 'text/plain'
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('success');
      });
    });
  });

  // --- NEGATIVOS: AUTH ---
  it('Falha sem token', () => {
    requirementsUpdate({
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', 'token_expirado', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      requirementsUpdate({
        token,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'id', 'requirement_title', 'requirement_summary', 'assignedto'].forEach(field => {
    it(`Falha sem campo obrigatório: ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      };
      delete body[field];
      requirementsUpdate(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  const invalidValues = [null, '', 'abc', 0, -1, 999999999, {}, [], true, false];
  [
    { field: 'project_id', valid: validProjectId },
    { field: 'id', valid: validRequirementId },
    { field: 'assignedto', valid: validAssignedTo }
  ].forEach(({ field, valid }) => {
    invalidValues.forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          id: validRequirementId,
          requirement_title: validTitle,
          requirement_summary: validSummary,
          assignedto: validAssignedTo
        };
        body[field] = value;
        requirementsUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  ['requirement_title', 'requirement_summary'].forEach(field => {
    ['', null, {}, [], 12345, true, false].forEach(value => {
      it(`Falha com ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          id: validRequirementId,
          requirement_title: validTitle,
          requirement_summary: validSummary,
          assignedto: validAssignedTo
        };
        body[field] = value;
        requirementsUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos opcionais inválidos ---
  Object.keys(optionalFields).forEach(field => {
    [null, {}, [], true, false].forEach(value => {
      it(`Falha (ou ignora) com campo opcional ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          id: validRequirementId,
          requirement_title: validTitle,
          requirement_summary: validSummary,
          assignedto: validAssignedTo,
          [field]: value
        };
        requirementsUpdate(body).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
  });

  // --- Attachment inválido ---
  [123, '', {}, [], true].forEach(value => {
    it(`Falha (ou ignora) com attachment inválido (${JSON.stringify(value)})`, () => {
      requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo,
        'attachment[]': value
      }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo,
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
          id: validRequirementId,
          requirement_title: validTitle,
          requirement_summary: validSummary,
          assignedto: validAssignedTo
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
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    requirementsUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    requirementsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validRequirementId,
      requirement_title: validTitle,
      requirement_summary: validSummary,
      assignedto: validAssignedTo
    })
      .then(() => requirementsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validRequirementId,
        requirement_title: validTitle,
        requirement_summary: validSummary,
        assignedto: validAssignedTo
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});