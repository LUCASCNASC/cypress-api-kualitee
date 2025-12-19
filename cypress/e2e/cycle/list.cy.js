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

describe('API rest - Cycle - Defects List - /defects/list', () => {

  it('Status Code 200', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code 200', () => {
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

  it('Status Code 400, 401, 403', () => {
    defectsList({
      project_id: validProjectId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 422', () => {
    defectsList({
      token: validToken
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code 200', () => {
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

  it('Status Code 200', () => {
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

  it('Status Code 200', () => {
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

  it('Status Code 200', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId,
      foo: 'bar'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code 400, 415', () => {
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
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectsList({
      token: "' OR 1=1 --",
      project_id: validProjectId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    defectsList({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code 429', () => {
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

  it('Status Code 200, 400, 401, 409', () => {
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