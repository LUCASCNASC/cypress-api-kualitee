const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Custom%20Fields/Create';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

const validFieldType = 'textbox';
const validCustomFieldModule = 'TestScenario';
const validCustomFieldName = 'MeuCampoCustomizado';
const validCustomFieldDesc = 'Descrição do campo customizado';

describe('API rest - Custom Fields - Custom Fields Create - /customfields/create', () => {

  it('Status Code 200', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Cria custom field com todos os parâmetros preenchidos', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      field_type: validFieldType,
      'custom_field_module[0]': validCustomFieldModule,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha sem token', () => {
    customfieldsCreate({
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id[0]', () => {
    customfieldsCreate({
      token: validToken,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem custom_field_name', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem custom_field_desc', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
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
    customfieldsCreate({
      token: "' OR 1=1 --",
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      customfieldsCreate({
        token: validToken,
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
  
  it('Permite requisições duplicadas rapidamente', () => {
    customfieldsCreate({
      token: validToken,
      'project_id[0]': validProjectId,
      custom_field_name: validCustomFieldName,
      custom_field_desc: validCustomFieldDesc
    })
    .then(() =>
      customfieldsCreate({
        token: validToken,
        'project_id[0]': validProjectId,
        custom_field_name: validCustomFieldName,
        custom_field_desc: validCustomFieldDesc
      }))
    .then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });
});