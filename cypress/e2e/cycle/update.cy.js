const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/Update';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

const validDefectId = 101;
const validDescription = 'Atualização do defeito: fluxo login falha em ambiente staging';
const validBrowserName = 'Chrome';
const validDefectType = 'Bug';
const validOsType = 'iOS';
const validSeverity = 'Minor';
const validStepsToReproduce = '1. Abrir app\n2. Tentar login\n3. Receber erro';
const validExpectedResult = 'Login deve funcionar normalmente';
const validComments = 'Ocorrência esporádica';
const validPriority = 'Medium';
const validDevices = 'iPhone 14';
const validStatus = 'Open';
const validAssignto = '123';
const validDefectViewers = '456';
const validBugtype = 'Backend';
const validIntegration = 'jira';
const validKiId = 'ki-54321';
const validReqId = 'req-87654';
const validBugRequirementId = 'bug-req-66';
const validDefectImage = 'cypress/fixtures/defect_image.png';

describe('API rest - Cycle - Defects Update - /defects/update', () => {
  
  function defectsUpdate(body, fileFields = {}, options = {}) {
    // Se for enviar arquivos, use cy.form_request customizado ou plugin adequado
    if (Object.keys(fileFields).length) {
      return cy.form_request(
        'POST',
        `/${PATH_API}`,
        body,
        Object.entries(fileFields).map(([name, filePath]) => ({
          name,
          fileName: filePath.split('/').pop(),
          mimeType: 'image/png',
          fileContent: '', // Ajustar conforme fixture
          encoding: 'base64'
        })),
        { failOnStatusCode: false, ...options }
      );
    }
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Atualiza defeito com campos mínimos obrigatórios', () => {
    defectsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Atualiza defeito com todos os campos preenchidos', () => {
    defectsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validDefectId,
      build_id: validBuildId,
      module_id: validModuleId,
      description: validDescription,
      browser_name: validBrowserName,
      defect_type: validDefectType,
      os_type: validOsType,
      severity: validSeverity,
      steps_to_reproduce: validStepsToReproduce,
      expected_result: validExpectedResult,
      comments: validComments,
      priority: validPriority,
      devices: validDevices,
      status: validStatus,
      assignto: validAssignto,
      defect_viewers: validDefectViewers,
      bugtype: validBugtype,
      integration: validIntegration,
      ki_id: validKiId,
      req_id: validReqId,
      bug_requirement_id: validBugRequirementId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVO: Auth ---
  it('Falha sem token', () => {
    defectsUpdate({
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsUpdate({
        token,
        project_id: validProjectId,
        id: validDefectId,
        description: validDescription
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_id', 'id', 'description'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        id: validDefectId,
        description: validDescription
      };
      delete body[field];
      defectsUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsUpdate({
        token: validToken,
        project_id,
        id: validDefectId,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(id => {
    it(`Falha com id inválido (${JSON.stringify(id)})`, () => {
      defectsUpdate({
        token: validToken,
        project_id: validProjectId,
        id,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', {}, [], true, false].forEach(invalidDesc => {
    it(`Falha com description inválido (${JSON.stringify(invalidDesc)})`, () => {
      defectsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validDefectId,
        description: invalidDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos opcionais inválidos ---
  const invalidArray = [null, '', {}, true, false];
  [
    'build_id', 'module_id', 'browser_name', 'defect_type', 'os_type', 'severity', 'steps_to_reproduce',
    'expected_result', 'comments', 'priority', 'devices', 'status', 'assignto', 'defect_viewers', 'bugtype',
    'integration', 'ki_id', 'req_id', 'bug_requirement_id'
  ].forEach(field => {
    invalidArray.forEach(value => {
      it(`Falha com campo opcional ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          id: validDefectId,
          description: validDescription
        };
        body[field] = value;
        defectsUpdate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Teste de Upload de Imagem (se suportado) ---
  /*
  it('Atualiza defeito com upload de imagem', () => {
    cy.fixture('defect_image.png', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        '/Defect/Update',
        {
          token: validToken,
          project_id: validProjectId,
          id: validDefectId,
          description: validDescription
        },
        [
          { name: 'defect_image[]', fileName: 'defect_image.png', mimeType: 'image/png', fileContent, encoding: 'base64' }
        ]
      ).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });
  */

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    defectsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription,
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
          project_id: validProjectId,
          id: validDefectId,
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
        id: validDefectId,
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
    defectsUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validDefectId,
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
    defectsUpdate({
      token: validToken,
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(() =>
      defectsUpdate({
        token: validToken,
        project_id: validProjectId,
        id: validDefectId,
        description: validDescription
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});