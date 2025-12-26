const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Custom%20Fields/Delete';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCustomFieldId = 123;

describe('API rest - Custom Fields - Custom Fields Delete - /customfields/delete', () => {

  it('Status Code is 200', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {
    customfieldsDelete({ project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    customfieldsDelete({ token: validToken, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 400, 422, 404', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: { token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    customfieldsDelete({ token: "' OR 1=1 --", project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 429', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code is 200, 400, 401, 409', () => {
    customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId })
      .then(() => customfieldsDelete({ token: validToken, project_id: validProjectId, 'custom_field_id[0]': validCustomFieldId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});