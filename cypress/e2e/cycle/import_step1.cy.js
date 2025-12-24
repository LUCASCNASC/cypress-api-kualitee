const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Defect/importstepone';
const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsvFile = 'cypress/fixtures/defects_import.csv';

describe('API rest - Cycle - Defects Import Step 1 - /defects/import/step1', () => {


  it('Status Code is 200', () => {

    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {

    defectsImportStep1(
      {
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422', () => {

    defectsImportStep1(
      {
        token: validToken
      },
      validCsvFile
    ).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422', () => {

    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      ''
    ).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {

    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId,
        foo: 'bar'
      },
      validCsvFile
    ).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {

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

    defectsImportStep1(
      {
        token: "' OR 1=1 --",
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {

    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {

    const requests = Array(10).fill(0).map(() =>
      defectsImportStep1(
        {
          token: validToken,
          project_id: validProjectId
        },
        validCsvFile
      )
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {

    defectsImportStep1(
      {
        token: validToken,
        project_id: validProjectId
      },
      validCsvFile
    ).then(() =>
      defectsImportStep1(
        {
          token: validToken,
          project_id: validProjectId
        },
        validCsvFile
      )
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});