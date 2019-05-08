pipeline {
  agent none
  stages {
    stage('Test') {
      agent {
        docker {
          image 'node:12'
          args '-w /app -v $PWD:/app'
        }

      }
      environment {
        npm_config_cache = 'npm-cache'
        HOME = '.'
        CI = '1'
      }
      steps {
        sh 'npm install'
        sh 'npm test -- --coverage'
        withCredentials([string(credentialsId: 'codecovToken', variable: 'CODECOV_TOKEN')]) {
          sh '''
            set +x
            curl -s https://codecov.io/bash | bash -s -- -c -f coverage/coverage-final.json
          '''
        }
      }
    }
  }
}