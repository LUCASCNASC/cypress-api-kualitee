// Testes automatizados para API: POST /defects/create
// Segue o padrão do arquivo de exemplo fornecido (update.cy.js)

describe('API - Defects Create - /defects/create', () => {
  const validToken = 'token_valido_aqui';
  const validProjectId = 77;
  const validBuildId = 10;
  const validModuleId = 22;
  const validDescription = 'Defeito crítico na tela de login';
  const validSourceName = 'QA';
  const validDefectStatus = 'New';
  const validDefectType = 'Bug';
  const validEditor = 'lucas.nascimento';
  const validStepsToReproduce = '1. Abrir tela de login\n2. Inserir credenciais inválidas\n3. Clicar em "Entrar"';
  const validExpectedResult = 'Mensagem de erro amigável';
  const validComments = 'Reproduzido em ambiente de homologação';
  const validPriority = 'High';
  const validDevices = 'iPhone 13';
  const validStatus = 'Open';
  const validAssignto = '123';
  const validDefectViewers = '456';
  const validBugtype = 'UI';
  const validIntegration = 'jira';
  const validKiId = 'ki-12345';
  const validReqId = 'req-98765';
  const validBugRequirementId = 'bug-req-55';

  // Simulação de arquivos (se a API aceitar)
  const validDefectImage = 'cypress/fixtures/defect_image.png';

  function defectsCreate(body, fileFields = {}, options = {}) {
    // Se for enviar arquivos, use cy.form_request customizado ou plugin adequado
    if (Object.keys(fileFields).length) {
      return cy.form_request(
        'POST',
        `${BASE_URL}/Defect/Create`,
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
      url: `${BASE_URL}/Defect/Create`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Cria defeito com campos mínimos obrigatórios', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Cria defeito com todos os campos preenchidos', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      module_id: validModuleId,
      description: validDescription,
      source_name: validSourceName,
      defect_status: validDefectStatus,
      defect_type: validDefectType,
      editor: validEditor,
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
    defectsCreate({
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      defectsCreate({
        token,
        project_id: validProjectId,
        description: validDescription
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios ausentes ---
  it('Falha sem project_id', () => {
    defectsCreate({
      token: validToken,
      description: validDescription
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Falha sem description', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios inválidos ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectsCreate({
        token: validToken,
        project_id,
        description: validDescription
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', {}, [], true, false].forEach(invalidDesc => {
    it(`Falha com description inválido (${JSON.stringify(invalidDesc)})`, () => {
      defectsCreate({
        token: validToken,
        project_id: validProjectId,
        description: invalidDesc
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos opcionais inválidos ---
  const invalidArray = [null, '', {}, true, false];
  [
    'build_id', 'module_id', 'source_name', 'defect_status', 'defect_type', 'editor', 'steps_to_reproduce',
    'expected_result', 'comments', 'priority', 'devices', 'status', 'assignto', 'defect_viewers', 'bugtype',
    'integration', 'ki_id', 'req_id', 'bug_requirement_id'
  ].forEach(field => {
    invalidArray.forEach(value => {
      it(`Falha com campo opcional ${field} inválido (${JSON.stringify(value)})`, () => {
        const body = {
          token: validToken,
          project_id: validProjectId,
          description: validDescription
        };
        body[field] = value;
        defectsCreate(body).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Teste de Upload de Imagem (se suportado) ---
  // Exemplo: adapte para seu plugin de upload, se necessário
  /* 
  it('Cria defeito com upload de imagem', () => {
    cy.fixture('defect_image.png', 'base64').then(fileContent => {
      cy.form_request(
        'POST',
        `${BASE_URL}/Defect/Create`,
        {
          token: validToken,
          project_id: validProjectId,
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
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
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
        url: `${BASE_URL}/Defect/Create`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
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
      url: `${BASE_URL}/Defect/Create`,
      body: {
        token: validToken,
        project_id: validProjectId,
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
    defectsCreate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectsCreate({
        token: validToken,
        project_id: validProjectId,
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
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      description: validDescription
    }).then(() =>
      defectsCreate({
        token: validToken,
        project_id: validProjectId,
        description: validDescription
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});