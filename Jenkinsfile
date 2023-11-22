pipeline{
    agent none
    environment {
        DOCKER_IMAGE= "backend-20ktpm1-app"
    }
    stages{
        stage("Test"){
            agent {
                docker {
                    image 'node:alpine'
                    args '-u 0:0 -v /tmp:/root/.cache'
                }
            }
            steps{
                echo "Running Test..."
                sh "npm install"
                sh "npm run test --if-present"
            }
        }
    }
}