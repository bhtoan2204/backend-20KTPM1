import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Inject, Injectable } from "@nestjs/common";
import { User } from "src/utils/schema/user.schema";
import { UserResult } from './interface/user-search-results.interace';
import { UserBody } from './interface/user-search-body.interface';


@Injectable()
export class SearchService {
    index = 'users'
    constructor(
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService
    ) { }

    async indexUser(currentUser: User) {
        return this.elasticsearchService.index<UserResult, UserBody>({
            index: this.index,
            body: {
                id: currentUser._id,
                email: currentUser.email,
                fullname: currentUser.fullname,
                role: currentUser.role,
                login_type: currentUser.login_type,
                student_id: currentUser.student_id.toString(),
            }
        })
    }

    private validateInput(query: string): void {
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid search query');
        }
    }

    private buildStudentIdQuery(query: string): any {
        return {
            wildcard: {
                student_id: `*${query}*`,
            },
        };
    }

    private buildNameQuery(query: string): any {
        return {
            multi_match: {
                query,
                fields: ['fullname'],
                type: 'cross_fields',
                operator: 'and',
            },
        };
    }

    private buildEmailQuery(query: string): any {
        return {
            bool: {
                should: [
                    { term: { email: query } },
                    { match_phrase: { email: query } },
                ],
                minimum_should_match: 1,
            },
        };
    }

    async search(text: string) {
        this.validateInput(text);

        const nameQuery = this.buildNameQuery(text);
        const emailQuery = this.buildEmailQuery(text);
        const studentIdQuery = this.buildStudentIdQuery(text);

        const { body } = await this.elasticsearchService.search<UserResult>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        should: [
                            { bool: { must: nameQuery } },
                            { bool: { must: emailQuery } },
                            { bool: { must: studentIdQuery } },
                        ],
                    }
                }
            }
        });

        const hits = body.hits.hits;
        return hits.map(hit => hit._source);
    }

    async update(currentUser: User) {
        const newBody: UserBody = {
            id: currentUser._id,
            email: currentUser.email,
            fullname: currentUser.fullname,
            role: currentUser.role,
            login_type: currentUser.login_type,
            student_id: currentUser.student_id.toString(),
        }

        const script = Object.entries(newBody).reduce((result, [key, value]) => {
            return `${result} ctx._source.${key}='${value}';`;
        }, '');

        return this.elasticsearchService.updateByQuery({
            index: this.index,
            body: {
                query: {
                    match: {
                        id: currentUser._id
                    }
                },
                script: {
                    inline: script
                }
            }
        });
    }
}
