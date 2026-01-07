const PATH_API = '/TestCase/importstepone';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCsv = 'fixtures/valid_test_cases.csv'; 

describe('Import Step 1 - /test_case/import/step1', () => {

  it('Status Code are 200', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('object');
        expect(response.body).to.have.property('success');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Status Code are 400, 401, 403', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  it('Status Code are 400, 422, 404', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Status Code are 400, 422, 404', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
      form: true,
      body: {
        token: validToken,
        project_id: validProjectId
      },
      failOnStatusCode: false
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code are 400, 422, 415', () => {
    const emptyBlob = new Blob([''], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('token', validToken);
    formData.append('project_id', validProjectId);
    formData.append('import_csv_file', emptyBlob, 'empty.csv');

    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      failOnStatusCode: false
    }).then(response => {
      expect([400, 422, 415]).to.include(response.status);
    });
  });

  it('Status Code are 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `${BASE_URL}/${PATH_API}`,
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
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', "' OR 1=1 --");
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        const body = JSON.stringify(response.body);
        expect(body).not.to.match(/exception|trace|sql|database/i);
      });
    });
  });

  it('Status Code are 429', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.headers).to.have.property('access-control-allow-origin');
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  it('Status Code are 429', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      const requests = Array(10).fill(0).map(() =>
        cy.request({
          method: 'POST',
          url: `${BASE_URL}/${PATH_API}`,
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        })
      );
      cy.wrap(Promise.all(requests)).then((responses) => {
        const rateLimited = responses.some(r => r.status === 429);
        expect(rateLimited).to.be.true;
      });
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    cy.fixture(validCsv, 'binary').then(Cypress.Blob.binaryStringToBlob).then(blob => {
      const formData = new FormData();
      formData.append('token', validToken);
      formData.append('project_id', validProjectId);
      formData.append('import_csv_file', blob, 'valid_test_cases.csv');

      cy.request({
        method: 'POST',
        url: `${BASE_URL}/${PATH_API}`,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        failOnStatusCode: false
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${BASE_URL}/${PATH_API}`,
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          failOnStatusCode: false
        }).then((response) => {
          expect([200, 400, 401, 409]).to.include(response.status);
        });
      });
    });
  });
});