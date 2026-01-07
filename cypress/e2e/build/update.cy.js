const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Build/BuildsUpdate';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validStartDate = Cypress.env('VALID_START_DATE');
const validBuildId = Cypress.env('VALID_BUILD_ID');
const validId = Cypress.env('VALID_ID');

const validEndDate = '2020-06-02';
const validDescription = 'Atualização de build';

describe('Build - Builds Update - /build/update', () => {

  it('Status Code are 200', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 400, 401, 403', () => {
    buildUpdate({
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    buildUpdate({
      token: 'token_invalido',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 401, 403', () => {
    buildUpdate({
      token: 'token_expirado',
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 400, 401, 403', () => {
    buildUpdate({
      token: null,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code are 200', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription,
      extra: 'foo'
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
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    buildUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Status Code are 429', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code are 429', () => {
    const requests = Array(10).fill(0).map(() =>
      buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code are 200, 400, 401, 409', () => {
    buildUpdate({
      token: validToken,
      project_id: validProjectId,
      start_date: validStartDate,
      end_date: validEndDate,
      build_id: validBuildId,
      id: validId,
      description: validDescription
    })
      .then(() => buildUpdate({
        token: validToken,
        project_id: validProjectId,
        start_date: validStartDate,
        end_date: validEndDate,
        build_id: validBuildId,
        id: validId,
        description: validDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});