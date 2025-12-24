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


  it('Status Code is 200', () => {

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

  it('Status Code is 200', () => {

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

  it('Status Code is 400, 401, 403', () => {

    defectsUpdate({
      project_id: validProjectId,
      id: validDefectId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {

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

  it('Status Code is 400, 415', () => {

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

  it('Status Code is 429', () => {

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

  it('Status Code is 200, 400, 401, 409', () => {

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