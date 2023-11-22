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
                    args '-u root -v /tmp:/root/.cache'
                }
            }
            steps{
                echo "Running Test..."
                sh "npm install"
                sh "npm run test --if-present"
            }
        }
        
        // stage("Build")
        //     agent none
        //     steps{
        //         echo "Running Build"
        //         sh "npm run build"
        //     }
    }
    // post{
    //     success{
    //         echo "========pipeline executed successfully ========"
    //     }
    //     failure{
    //         echo "========pipeline execution failed========"
    //     }
    // }
}