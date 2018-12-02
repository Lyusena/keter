/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package ru.avplatonov.keter.core.worker.work.executor

import com.spotify.docker.client.{DefaultDockerClient, DockerClient}

class DockerExecutorTest extends ExecutorTest {
    var docker: DockerClient = new DefaultDockerClient("http://localhost:2375")

    override protected def afterAll(): Unit = {
        super.afterAll()
        docker.close()
    }

    override protected def getTestExecutor(): Executor = new DockerExecutor(_ => getLogger())(docker, "aplatonov/linux_with_java")
}
