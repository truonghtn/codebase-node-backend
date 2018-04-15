import * as moment from 'moment';
export class HC {
    static readonly SUCCESS = {success: true};
    static NOT_SUCCESS(msg?: string) {
        return {
            success: false,
            msg: msg
        }
    }
    static readonly MINUTES_PER_DAY = 24 * 60;
    static readonly ORDER_EXPIRATION = 2; // hours
    static readonly FIRST_DAY = moment([2010, 1, 1]);
    static readonly HUMAN32_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
}

export default HC;