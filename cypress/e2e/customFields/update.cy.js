const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Custom%20Fields/Update';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validCustomFieldId = 456;
const validFieldType = 'textbox';
const validCustomFieldModule = 'TestScenario';
const validCustomFieldName = 'MeuCampoCustomizadoAtualizado';
const validCustomFieldDesc = 'Descrição atualizada do campo customizado';

describe('API rest - Custom Fields - Custom Fields Update - /customfields/update', () => {

  it('Status Code 200', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code 200, 400, 401, 409', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      field_type: validFieldType,
      'custom_field_module[0]': validCustomFieldModule,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code 400, 401, 403', () => {
    customfieldsUpdate({
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code 400, 422, 404', () => {
    customfieldsUpdate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code 400, 422, 404', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code 400, 422, 404', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code 400, 422, 404', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Status Code 200', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc,
      extra: 'foo'
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
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    customfieldsUpdate({
      token: "' OR 1=1 --",
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code 429', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code 200, 400, 401, 409', () => {
    customfieldsUpdate({
      token: validToken,
      custom_field_id: validCustomFieldId,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    })
    .then(() =>
      customfieldsUpdate({
        token: validToken,
        custom_field_id: validCustomFieldId,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }))
    .then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});