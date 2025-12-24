const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/Bulkupdate';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

describe('API rest - Cycle - Defects Bulk Update - /defects/bulkupdate', () => {


  it('Status Code is 200', () => {

    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 200', () => {

    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds,
      build_id: validBuildId,
      module_id: validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {

    bulkUpdateDefects({
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {

    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds,
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
        id: validIds
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    bulkUpdateDefects({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {

    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {

    const requests = Array(10).fill(0).map(() =>
      bulkUpdateDefects({
        token: validToken,
        project_id: validProjectId,
        id: validIds
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {

    bulkUpdateDefects({
      token: validToken,
      project_id: validProjectId,
      id: validIds
    }).then(() =>
      bulkUpdateDefects({
        token: validToken,
        project_id: validProjectId,
        id: validIds
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});