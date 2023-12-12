import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Inject, Injectable } from "@nestjs/common";
import { User } from "src/utils/schema/user.schema";
import { UserResult } from './interface/user-search-results.interace';
import { UserBody } from './interface/user-search-body.interface';

interface Class {
    class_id: string;
    class_name: string;
    class_description: string;
}

@Injectable()
export class SearchService {
    index = 'users'
    constructor(
        @Inject(ElasticsearchService) private readonly elasticsearchService: ElasticsearchService
    ) { }

    async indexUser(currentUser: User) {
        const currentUserClasses = currentUser.classes.map((classItem) => {
            const { class_id, class_name, class_description } = classItem;
            return {
                class_id: class_id.toString(),
                class_name,
                class_description,
            }
        })
        return this.elasticsearchService.index<UserResult, UserBody>({
            index: this.index,
            body: {
                _id: currentUser._id,
                fullname: currentUser.fullname,
                email: currentUser.email,
                role: currentUser.role,
                login_type: currentUser.login_type,
                avatar: currentUser.avatar,
                is_ban: currentUser.is_ban,
                classes: currentUserClasses,
            }
        });
    }

    private validateInput(query: string): void {
        if (!query || typeof query !== 'string') {
            throw new Error('Invalid search query');
        }
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

        const { body } = await this.elasticsearchService.search<UserResult>({
            index: this.index,
            body: {
                query: {
                    bool: {
                        should: [
                            { bool: { must: nameQuery } },
                            { bool: { must: emailQuery } },
                        ],
                    }
                }
            }
        });

        const hits = body.hits.hits;
        return hits.map(hit => hit._source);
    }

    async update(currentUser: User) {
        const currentUserClasses = currentUser.classes.map((classItem) => {
            const { class_id, class_name, class_description } = classItem;
            return {
                class_id: class_id.toString(),
                class_name,
                class_description,
            }
        })
        const newBody: UserBody = {
            _id: currentUser._id,
            fullname: currentUser.fullname,
            email: currentUser.email,
            role: currentUser.role,
            login_type: currentUser.login_type,
            avatar: currentUser.avatar,
            is_ban: currentUser.is_ban,
            classes: currentUserClasses,
        }

        const script = Object.entries(newBody).reduce((result, [key, value]) => {
            return `${result} ctx._source.${key}='${value}';`;
        }, '');

        return this.elasticsearchService.updateByQuery({
            index: this.index,
            body: {
                query: {
                    match: {
                        _id: currentUser._id
                    }
                },
                script: {
                    inline: script
                }
            }
        });
    }
}
