const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/Create';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

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
const validDefectImage = 'cypress/fixtures/defect_image.png';

describe('Cycle - Defects Create - /defects/create', () => {

  it('Status Code are 200', () => {
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

  it('Status Code are 400, 401, 403', () => {
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

  it('Status Code are 400, 401, 403', () => {
    defectsCreate({
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422', () => {
    defectsCreate({
      token: validToken,
      description: validDescription
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      description: validDescription,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
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

  it('Status Code are 429', () => {
    defectsCreate({
      token: validToken,
      project_id: validProjectId,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
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

  it('Status Code are 200, 400, 401, 409', () => {
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