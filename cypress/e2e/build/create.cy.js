const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Build/BuildsCreate';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validStartDate = Cypress.env('VALID_START_DATE');

const validEndDate = '2020-06-02';
const validBuildName = 'Build v1.2.3';
const validBuildDescription = 'Descrição do build de testes automáticos.';

describe('API rest - Build - Builds Create - /build/create', () => {


  function buildCreate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  it('Status Code is 200', () => {

    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code is 400, 401, 403', () => {

    buildCreate({
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {

    buildCreate({
      token: 'token_invalido',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {

    buildCreate({
      token: 'token_expirado',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 400, 401, 403', () => {

    buildCreate({
      token: null,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code is 200', () => {

    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code is 400, 415', () => {

    cy.request({
      method: 'POST',
      url: '/Build/BuildsCreate',
      body: {
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {

    buildCreate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {

    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Status Code is 429', () => {

    const requests = Array(10).fill(0).map(() =>
      buildCreate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Status Code is 200, 400, 401, 409', () => {

    buildCreate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_name: validBuildName,
      build_description: validBuildDescription
    })
      .then(() => buildCreate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_name: validBuildName,
        build_description: validBuildDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});